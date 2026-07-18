import { ApiResponse } from '../ApiResponse.js';

describe('ApiResponse', () => {
    it('should create an ApiResponse object with success true for status code < 400', () => {
        const response = new ApiResponse(200, { data: 'test' }, 'Success message');
        
        expect(response.statusCode).toBe(200);
        expect(response.data).toEqual({ data: 'test' });
        expect(response.message).toBe('Success message');
        expect(response.success).toBe(true);
    });

    it('should create an ApiResponse object with success false for status code >= 400', () => {
        const response = new ApiResponse(404, null, 'Not found');
        
        expect(response.statusCode).toBe(404);
        expect(response.data).toBeNull();
        expect(response.message).toBe('Not found');
        expect(response.success).toBe(false);
    });

    it('should use default message if not provided', () => {
        const response = new ApiResponse(200, { id: 1 });
        
        expect(response.message).toBe('Success');
    });
});
