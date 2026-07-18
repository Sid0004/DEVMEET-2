import { ApiError } from '../ApiError.js';

describe('ApiError', () => {
    it('should create an ApiError object with correct properties', () => {
        const error = new ApiError(404, 'Resource not found', ['error1', 'error2']);
        
        expect(error).toBeInstanceOf(Error);
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Resource not found');
        expect(error.errors).toEqual(['error1', 'error2']);
        expect(error.success).toBe(false);
        expect(error.data).toBeNull();
    });

    it('should use default values if not provided', () => {
        const error = new ApiError(500);
        
        expect(error.message).toBe('Something went wrong');
        expect(error.errors).toEqual([]);
        expect(error.stack).toBeDefined();
    });

    it('should preserve custom stack trace if provided', () => {
        const customStack = 'Custom stack trace';
        const error = new ApiError(500, 'Error', [], customStack);
        
        expect(error.stack).toBe(customStack);
    });
});
