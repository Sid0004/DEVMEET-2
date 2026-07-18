import { jest } from '@jest/globals';
import { registerUser, loginUser, logoutUser } from '../user.controller.js';
import { User } from '../../models/user.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

describe('User Controller', () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        jest.restoreAllMocks();
        mockReq = { 
            body: {},
            cookies: {},
            header: jest.fn()
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn().mockReturnThis(),
            clearCookie: jest.fn().mockReturnThis()
        };
        mockNext = jest.fn();
    });

    describe('registerUser', () => {
        it('should call next with ApiError 400 if any field is missing', async () => {
            mockReq.body = { fullName: '', email: 'test@example.com', username: 'testuser', password: 'password123' };
            
            await registerUser(mockReq, mockRes, mockNext);
            
            expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
            expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
            expect(mockNext.mock.calls[0][0].message).toBe('All fields are required');
        });

        it('should call next with ApiError 409 if user already exists', async () => {
            mockReq.body = { fullName: 'Test User', email: 'test@example.com', username: 'testuser', password: 'password123' };
            
            // Mock User.findOne to simulate an existing user
            jest.spyOn(User, 'findOne').mockResolvedValue({ _id: '123' });
            
            await registerUser(mockReq, mockRes, mockNext);
            
            expect(User.findOne).toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
            expect(mockNext.mock.calls[0][0].statusCode).toBe(409);
        });

        it('should register successfully if data is valid', async () => {
            mockReq.body = { fullName: 'Test User', email: 'test@example.com', username: 'testuser', password: 'password123' };
            
            // Mock User.findOne to simulate user not existing yet
            jest.spyOn(User, 'findOne').mockResolvedValue(null);
            
            // Mock User.create to simulate creation
            jest.spyOn(User, 'create').mockResolvedValue({ _id: 'new_user_id' });
            
            // Mock User.findById to simulate fetching the created user (without password)
            const mockCreatedUser = { _id: 'new_user_id', username: 'testuser', email: 'test@example.com' };
            jest.spyOn(User, 'findById').mockReturnValue({
                select: jest.fn().mockResolvedValue(mockCreatedUser)
            });
            
            await registerUser(mockReq, mockRes, mockNext);
            
            expect(User.create).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 200,
                    success: true,
                    message: 'User registered successfully',
                    data: mockCreatedUser
                })
            );
        });

        it('should call next with ApiError 500 if User.findById returns null after creation (edge case)', async () => {
            mockReq.body = { fullName: 'Test User', email: 'test@example.com', username: 'testuser', password: 'password123' };
            jest.spyOn(User, 'findOne').mockResolvedValue(null);
            jest.spyOn(User, 'create').mockResolvedValue({ _id: 'new_user_id' });
            
            // Simulating failure to retrieve created user
            jest.spyOn(User, 'findById').mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });
            
            await registerUser(mockReq, mockRes, mockNext);
            
            expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
            expect(mockNext.mock.calls[0][0].statusCode).toBe(500);
            expect(mockNext.mock.calls[0][0].message).toBe('Something went wrong while registering the user');
        });
    });

    describe('loginUser', () => {
        it('should call next with ApiError 400 if identifier is missing', async () => {
            mockReq.body = { password: 'password123' }; // missing identifier, email, username
            
            await loginUser(mockReq, mockRes, mockNext);
            
            expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
            expect(mockNext.mock.calls[0][0].statusCode).toBe(400);
            expect(mockNext.mock.calls[0][0].message).toBe('Username or email is required');
        });

        it('should call next with ApiError 404 if user does not exist', async () => {
            mockReq.body = { identifier: 'testuser', password: 'password123' };
            jest.spyOn(User, 'findOne').mockResolvedValue(null);
            
            await loginUser(mockReq, mockRes, mockNext);
            
            expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
            expect(mockNext.mock.calls[0][0].statusCode).toBe(404);
            expect(mockNext.mock.calls[0][0].message).toBe('User does not exist');
        });

        it('should call next with ApiError 401 if password is invalid', async () => {
            mockReq.body = { identifier: 'testuser', password: 'wrongpassword' };
            const mockUser = {
                _id: '123',
                isPasswordCorrect: jest.fn().mockResolvedValue(false)
            };
            jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
            
            await loginUser(mockReq, mockRes, mockNext);
            
            expect(mockUser.isPasswordCorrect).toHaveBeenCalledWith('wrongpassword');
            expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
            expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
            expect(mockNext.mock.calls[0][0].message).toBe('Invalid user credentials');
        });

        it('should login successfully and return tokens', async () => {
            mockReq.body = { identifier: 'testuser', password: 'password123' };
            
            const mockUser = {
                _id: '123',
                isPasswordCorrect: jest.fn().mockResolvedValue(true),
                generateAccessToken: jest.fn().mockReturnValue('mock_access_token'),
                generateRefreshToken: jest.fn().mockReturnValue('mock_refresh_token'),
                save: jest.fn().mockResolvedValue(true)
            };
            
            const mockLoggedInUser = { _id: '123', username: 'testuser', email: 'test@example.com' };

            jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
            
            // Mocking User.findById to handle both token generation and user selection
            jest.spyOn(User, 'findById').mockImplementation(() => {
                return {
                    ...mockUser,
                    select: jest.fn().mockResolvedValue(mockLoggedInUser)
                };
            });
            
            await loginUser(mockReq, mockRes, mockNext);
            
            expect(mockRes.cookie).toHaveBeenCalledWith('accessToken', 'mock_access_token', expect.any(Object));
            expect(mockRes.cookie).toHaveBeenCalledWith('refreshToken', 'mock_refresh_token', expect.any(Object));
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    statusCode: 200,
                    success: true,
                    message: 'User logged in successfully',
                    data: expect.objectContaining({
                        user: mockLoggedInUser,
                        accessToken: 'mock_access_token',
                        refreshToken: 'mock_refresh_token'
                    })
                })
            );
        });
    });

    describe('logoutUser', () => {
        it('should call next with ApiError 401 if req.user is missing', async () => {
            await logoutUser(mockReq, mockRes, mockNext);
            
            expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
            expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
            expect(mockNext.mock.calls[0][0].message).toBe('Unauthorized');
        });

        it('should logout successfully by unsetting refreshToken and clearing cookies', async () => {
            mockReq.user = { _id: '123' };
            
            jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValue(true);
            
            await logoutUser(mockReq, mockRes, mockNext);
            
            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                '123',
                { $set: { refreshToken: undefined } },
                { new: true }
            );
            expect(mockRes.clearCookie).toHaveBeenCalledWith('accessToken', expect.any(Object));
            expect(mockRes.clearCookie).toHaveBeenCalledWith('refreshToken', expect.any(Object));
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: 'User logged out'
                })
            );
        });
    });
});
