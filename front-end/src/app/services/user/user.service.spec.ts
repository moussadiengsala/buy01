import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { UserService } from './user.service';
import { TokenService } from '../token/token.service';
import { MediaService } from '../media/media.service';
import { AuthService } from '../auth/auth.service';
import { ApiResponse, PaginatedResponse, Tokens, User, Role } from '../../types';
import { environment } from '../../environment';

describe('UserService', () => {
    let service: UserService;
    let httpMock: HttpTestingController;
    let tokenServiceMock: jasmine.SpyObj<TokenService>;
    let mediaServiceMock: jasmine.SpyObj<MediaService>;
    let authServiceMock: jasmine.SpyObj<AuthService>;

    const mockToken = {
        accessToken: 'fake-access-token',
        refreshToken: 'fake-refresh-token'
    };

    const mockUser: User = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: Role.CLIENT,
        avatar: 'https://example.com/avatar.jpg'
    };

    const mockTokens: Tokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
    };

    beforeEach(() => {
        tokenServiceMock = jasmine.createSpyObj('TokenService', ['parse']);
        Object.defineProperty(tokenServiceMock, 'token', {
            get: () => mockToken,
            configurable: true
        });
        tokenServiceMock.parse.and.returnValue({avatar: null, email: "", name: "", role: "CLIENT", id: 'user123' });

        mediaServiceMock = jasmine.createSpyObj('MediaService', ['uploadMedia']);
        authServiceMock = jasmine.createSpyObj('AuthService', ['updateUserState', 'logout']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                UserService,
                { provide: TokenService, useValue: tokenServiceMock },
                { provide: MediaService, useValue: mediaServiceMock },
                { provide: AuthService, useValue: authServiceMock },
            ]
        });

        service = TestBed.inject(UserService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify(); // Verifies that no requests are outstanding
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getUserById', () => {
        it('should fetch user by id', () => {
            const mockResponse: ApiResponse<User> = {
                status: 200,
                message: 'User fetched successfully',
                data: mockUser
            };

            service.getUserById('user123').subscribe(response => {
                expect(response).toEqual(mockResponse);
            });

            const req = httpMock.expectOne(`${environment.apiUrl}users/user123`);
            expect(req.request.method).toBe('GET');
            expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken.accessToken}`);
            req.flush(mockResponse);
        });

        it('should handle error when fetching user fails', () => {
            const errorMessage = 'Failed to fetch user. Please try again later.';
            spyOn(console, 'error'); // Spy on console.error to prevent test output pollution

            service.getUserById('user123').subscribe({
                next: () => fail('Expected an error, not user data'),
                error: error => {
                    expect(error.message).toBe(errorMessage);
                }
            });

            const req = httpMock.expectOne(`${environment.apiUrl}users/user123`);
            req.error(new ErrorEvent('Network error'));
        });
    });

    describe('updateUser', () => {
        it('should update user and handle successful response', () => {
            const userId = 'user123';
            const formData = new FormData();
            formData.append('name', 'Updated Name');

            const mockResponse: ApiResponse<Tokens> = {
                status: 200,
                message: 'User updated successfully',
                data: mockTokens
            };

            service.updateUser(userId, formData).subscribe(response => {
                expect(response).toEqual(mockResponse);
                expect(authServiceMock.updateUserState).toHaveBeenCalledWith(mockTokens);
            });

            const req = httpMock.expectOne(`${environment.apiUrl}users/${userId}`);
            expect(req.request.method).toBe('PUT');
            expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken.accessToken}`);
            req.flush(mockResponse);
        });

        it('should handle error when updating user fails', () => {
            const userId = 'user123';
            const formData = new FormData();
            const errorMessage = 'Failed to update user. Please try again later.';
            spyOn(console, 'error'); // Spy on console.error to prevent test output pollution

            service.updateUser(userId, formData).subscribe({
                next: () => fail('Expected an error, not success'),
                error: error => {
                    expect(error.message).toBe(errorMessage);
                    expect(authServiceMock.updateUserState).not.toHaveBeenCalled();
                }
            });

            const req = httpMock.expectOne(`${environment.apiUrl}users/${userId}`);
            req.error(new ErrorEvent('Network error'));
        });
    });

    describe('deleteUser', () => {
        it('should delete user and call logout if deleting own account', () => {
            const userId = 'user123';
            const mockResponse: ApiResponse<User> = {
                status: 200,
                message: 'User deleted successfully',
                data: mockUser
            };

            service.deleteUser(userId).subscribe(response => {
                expect(response).toEqual(mockResponse);
                expect(authServiceMock.logout).toHaveBeenCalled();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}users/${userId}`);
            expect(req.request.method).toBe('DELETE');
            expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken.accessToken}`);
            req.flush(mockResponse);
        });

        it('should delete user without logout if deleting another account', () => {
            const userId = 'otherUser456';
            const mockResponse: ApiResponse<User> = {
                status: 200,
                message: 'User deleted successfully',
                data: { ...mockUser, id: userId }
            };

            service.deleteUser(userId).subscribe(response => {
                expect(response).toEqual(mockResponse);
                expect(authServiceMock.logout).not.toHaveBeenCalled();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}users/${userId}`);
            req.flush(mockResponse);
        });

        it('should handle error when deleting user fails', () => {
            const userId = 'user123';
            const errorMessage = 'Failed to delete user. Please try again later.';
            spyOn(console, 'error'); // Spy on console.error to prevent test output pollution

            service.deleteUser(userId).subscribe({
                next: () => fail('Expected an error, not success'),
                error: error => {
                    expect(error.message).toBe(errorMessage);
                    expect(authServiceMock.logout).not.toHaveBeenCalled();
                }
            });

            const req = httpMock.expectOne(`${environment.apiUrl}users/${userId}`);
            req.error(new ErrorEvent('Network error'));
        });
    });

    describe('getAllUsers', () => {
        it('should fetch all users with default pagination', () => {
            const mockPaginatedResponse: PaginatedResponse<User> = {
                content: [mockUser],
                page: {
                    totalPages: 1,
                    totalElements: 1,
                    size: 10,
                    number: 0
                }
            };

            service.getAllUsers().subscribe(response => {
                expect(response).toEqual(mockPaginatedResponse);
            });

            const req = httpMock.expectOne(`${environment.apiUrl}users?page=1&limit=10`);
            expect(req.request.method).toBe('GET');
            expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken.accessToken}`);
            req.flush(mockPaginatedResponse);
        });

        it('should fetch users with custom pagination', () => {
            const page = 2;
            const limit = 5;
            const mockPaginatedResponse: PaginatedResponse<User> = {
                content: [mockUser],
                page: {
                    totalPages: 3,
                    totalElements: 15,
                    size: limit,
                    number: page - 1
                }
            };

            service.getAllUsers(page, limit).subscribe(response => {
                expect(response).toEqual(mockPaginatedResponse);
                expect(response.page.number).toBe(page - 1);
                expect(response.page.size).toBe(limit);
            });

            const req = httpMock.expectOne(`${environment.apiUrl}users?page=${page}&limit=${limit}`);
            req.flush(mockPaginatedResponse);
        });

        it('should handle error when fetching users fails', () => {
            const errorMessage = 'Failed to fetch users. Please try again later.';
            spyOn(console, 'error'); // Spy on console.error to prevent test output pollution

            service.getAllUsers().subscribe({
                next: () => fail('Expected an error, not users data'),
                error: error => {
                    expect(error.message).toBe(errorMessage);
                }
            });

            const req = httpMock.expectOne(`${environment.apiUrl}users?page=1&limit=10`);
            req.error(new ErrorEvent('Network error'));
        });
    });

    describe('getAuthHeaders', () => {
        it('should create auth headers with access token', () => {
            const headers = (service as any).getAuthHeaders();
            expect(headers.get('Authorization')).toBe(`Bearer ${mockToken.accessToken}`);
        });

        it('should handle undefined token gracefully', () => {
            Object.defineProperty(tokenServiceMock, 'token', {
                get: () => null,
                configurable: true
            });

            const headers = (service as any).getAuthHeaders();
            expect(headers.get('Authorization')).toBe('Bearer undefined');
        });
    });
});







// import { TestBed } from '@angular/core/testing';
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import {HttpHeaders, HttpResponse, HttpStatusCode} from '@angular/common/http';
//
// import { UserService } from './user.service';
// import { TokenService } from '../token/token.service';
// import { MediaService } from '../media/media.service';
// import { AuthService } from '../auth/auth.service';
// import { ApiResponse, PaginatedResponse, Tokens, User, Role } from '../../types';
// import { environment } from '../../environment';
// import {of, throwError} from "rxjs";
//
// describe('UserService', () => {
//     let service: UserService;
//     let tokenServiceMock: jasmine.SpyObj<TokenService>;
//     let mediaServiceMock: jasmine.SpyObj<MediaService>;
//     let authServiceMock: jasmine.SpyObj<AuthService>;
//
//     const mockToken = {
//         accessToken: 'fake-access-token',
//         refreshToken: 'fake-refresh-token'
//     };
//
//     const mockUser: User = {
//         id: 'user123',
//         email: 'test@example.com',
//         name: 'Test User',
//         role: Role.CLIENT,
//         avatar: 'https://example.com/avatar.jpg'
//     };
//
//     const mockTokens: Tokens = {
//         accessToken: 'new-access-token',
//         refreshToken: 'new-refresh-token'
//     };
//
//     beforeEach(() => {
//         tokenServiceMock = jasmine.createSpyObj('TokenService', ['parse']);
//         Object.defineProperty(tokenServiceMock, 'token', {
//             get: () => mockToken,
//             configurable: true
//         });
//         tokenServiceMock.parse.and.returnValue({avatar: null, email: "", name: "", role: "CLIENT", id: 'user123' });
//
//         mediaServiceMock = jasmine.createSpyObj('MediaService', ['uploadMedia']);
//         authServiceMock = jasmine.createSpyObj('AuthService', ['updateUserState', 'logout']);
//
//         TestBed.configureTestingModule({
//             imports: [HttpClientTestingModule],
//             providers: [
//                 UserService,
//                 { provide: TokenService, useValue: tokenServiceMock },
//                 { provide: MediaService, useValue: mediaServiceMock },
//                 { provide: AuthService, useValue: authServiceMock },
//             ]
//         });
//
//         service = TestBed.inject(UserService);
//     });
//
//     it('should be created', () => {
//         expect(service).toBeTruthy();
//     });
//
//     describe('getUserById', () => {
//         it('should fetch user by id', (done) => {
//             const mockResponse: ApiResponse<User> = {
//                 status: 200,
//                 message: 'User fetched successfully',
//                 data: mockUser
//             };
//
//             // Mock the HTTP call
//             spyOn(service['http'], 'get').and.returnValue(of(mockResponse));
//
//             service.getUserById('user123').subscribe(response => {
//                 expect(response).toEqual(mockResponse);
//                 expect(service['http'].get).toHaveBeenCalledWith(
//                     `${environment.apiUrl}users/user123`,
//                     { headers: jasmine.any(HttpHeaders) }
//                 );
//                 done();
//             });
//         });
//
//         it('should handle error when fetching user fails', (done) => {
//             const errorMessage = 'Failed to fetch user. Please try again later.';
//             const errorResponse = new Error(errorMessage);
//
//             spyOn(service['http'], 'get').and.returnValue(throwError(() => errorResponse));
//
//             service.getUserById('user123').subscribe({
//                 next: () => fail('Expected an error, not user data'),
//                 error: error => {
//                     // Use toEqual for Error comparison
//                     expect(error).toEqual(jasmine.any(Error));
//                     // Match the exact error message
//                     expect(error.message).toBe(errorMessage);
//                     // Or use toContain if you only want to check part of the message
//                     // expect(error.message).toContain('Failed to fetch user');
//                     done();
//                 }
//             });
//         });
//     });
//
//     describe('updateUser', () => {
//         it('should update user and handle successful response', (done) => {
//             const userId = 'user123';
//             const formData = new FormData();
//             formData.append('name', 'Updated Name');
//
//             // 1. Create a complete mock response
//             const mockResponse: HttpResponse<ApiResponse<Tokens>> = new HttpResponse({
//                 status: HttpStatusCode.Ok,
//                 body: {
//                     status: HttpStatusCode.Ok,
//                     message: 'User updated successfully',
//                     data: mockTokens
//                 }
//             });
//
//             // 2. Properly mock the HTTP put request
//             spyOn(service['http'], 'put').and.returnValue(of(mockResponse));
//
//             // 3. Call the service method
//             service.updateUser(userId, formData).subscribe({
//                 next: (response) => {
//                     // 4. Verify the response
//                     expect(response).toEqual(mockResponse.body);
//
//                     // 5. Verify updateUserState was called
//                     expect(authServiceMock.updateUserState).toHaveBeenCalledWith(mockTokens);
//                     done();
//                 },
//                 error: (err) => {
//                     fail('Expected success but got error: ' + JSON.stringify(err));
//                     done();
//                 }
//             });
//
//             // 6. Verify the request was made correctly
//             expect(service['http'].put).toHaveBeenCalledWith(
//                 `${environment.apiUrl}users/${userId}`,
//                 formData,
//                 jasmine.objectContaining({
//                     headers: jasmine.any(HttpHeaders)
//                 })
//             );
//         });
//
//         it('should handle error when updating user fails', (done) => {
//             const userId = 'user123';
//             const formData = new FormData();
//             const errorResponse = new Error('Failed to update user');
//
//             spyOn(service['http'], 'put').and.returnValue(throwError(() => errorResponse));
//
//             service.updateUser(userId, formData).subscribe({
//                 next: () => fail('Expected an error, not success'),
//                 error: error => {
//                     // Use toEqual instead of toBe for error comparison
//                     expect(error).toEqual(jasmine.any(Error));
//                     expect(error.message).toContain('Failed to update user');
//                     expect(authServiceMock.updateUserState).not.toHaveBeenCalled();
//                     done();
//                 }
//             });
//         });
//     });
//
//     describe('deleteUser', () => {
//         it('should delete user and call logout if deleting own account', (done) => {
//             const userId = 'user123';
//             const mockResponse: ApiResponse<User> = {
//                 status: 200,
//                 message: 'User deleted successfully',
//                 data: mockUser
//             };
//
//             spyOn(service['http'], 'delete').and.returnValue(of(mockResponse));
//
//             service.deleteUser(userId).subscribe(response => {
//                 expect(response).toEqual(mockResponse);
//                 expect(authServiceMock.logout).toHaveBeenCalled();
//                 done();
//             });
//         });
//
//         it('should delete user without logout if deleting another account', (done) => {
//             const userId = 'otherUser456';
//             const mockResponse: ApiResponse<User> = {
//                 status: 200,
//                 message: 'User deleted successfully',
//                 data: { ...mockUser, id: userId }
//             };
//
//             spyOn(service['http'], 'delete').and.returnValue(of(mockResponse));
//
//             service.deleteUser(userId).subscribe(response => {
//                 expect(response).toEqual(mockResponse);
//                 expect(authServiceMock.logout).not.toHaveBeenCalled();
//                 done();
//             });
//         });
//
//         it('should handle error when deleting user fails', (done) => {
//             const userId = 'user123';
//             const expectedErrorMessage = 'Failed to delete user. Please try again later.';
//             const errorResponse = new Error(expectedErrorMessage);
//
//             // Mock the HTTP delete to return an error
//             spyOn(service['http'], 'delete').and.returnValue(throwError(() => errorResponse));
//
//             service.deleteUser(userId).subscribe({
//                 next: () => fail('Expected an error, not success'),
//                 error: (error) => {
//                     // Verify the error type
//                     expect(error).toEqual(jasmine.any(Error));
//                     // Verify the exact error message
//                     expect(error.message).toBe(expectedErrorMessage);
//                     // Alternative: Verify the message contains the key part
//                     // expect(error.message).toContain('Failed to delete user');
//                     // Verify logout wasn't called
//                     expect(authServiceMock.logout).not.toHaveBeenCalled();
//                     done();
//                 }
//             });
//         });
//     });
//
//     describe('getAllUsers', () => {
//         it('should fetch all users with default pagination', (done) => {
//             const mockPaginatedResponse: PaginatedResponse<User> = {
//                 content: [mockUser],
//                 page: {
//                     totalPages: 1,
//                     totalElements: 1,
//                     size: 10,
//                     number: 0
//                 }
//             };
//
//             spyOn(service['http'], 'get').and.returnValue(of(mockPaginatedResponse));
//
//             service.getAllUsers().subscribe(response => {
//                 expect(response).toEqual(mockPaginatedResponse);
//                 expect(service['http'].get).toHaveBeenCalledWith(
//                     `${environment.apiUrl}users?page=1&limit=10`,
//                     { headers: jasmine.any(HttpHeaders) }
//                 );
//                 done();
//             });
//         });
//
//         it('should fetch users with custom pagination', (done) => {
//             const page = 2;
//             const limit = 5;
//             const mockPaginatedResponse: PaginatedResponse<User> = {
//                 content: [mockUser],
//                 page: {
//                     totalPages: 3,
//                     totalElements: 15,
//                     size: limit,
//                     number: page - 1
//                 }
//             };
//
//             spyOn(service['http'], 'get').and.returnValue(of(mockPaginatedResponse));
//
//             service.getAllUsers(page, limit).subscribe(response => {
//                 expect(response).toEqual(mockPaginatedResponse);
//                 expect(response.page.number).toBe(page - 1);
//                 expect(response.page.size).toBe(limit);
//                 done();
//             });
//         });
//
//         it('should handle error when fetching users fails', (done) => {
//             // Create error with the exact message your service produces
//             const errorResponse = new Error('Failed to fetch users. Please try again later.');
//
//             spyOn(service['http'], 'get').and.returnValue(throwError(() => errorResponse));
//
//             service.getAllUsers().subscribe({
//                 next: () => fail('Expected an error, not users data'),
//                 error: (error) => {
//                     // Check error type
//                     expect(error).toEqual(jasmine.any(Error));
//                     // Check exact error message
//                     expect(error.message).toBe('Failed to fetch users. Please try again later.');
//                     // OR for more flexible checking:
//                     // expect(error.message).toContain('Failed to fetch users');
//                     done();
//                 }
//             });
//         });
//     });
//
//     describe('getAuthHeaders', () => {
//         it('should create auth headers with access token', () => {
//             const headers = (service as any).getAuthHeaders();
//             expect(headers.get('Authorization')).toBe(`Bearer ${mockToken.accessToken}`);
//         });
//
//         it('should handle undefined token gracefully', () => {
//             Object.defineProperty(tokenServiceMock, 'token', {
//                 get: () => null,
//                 configurable: true
//             });
//
//             const headers = (service as any).getAuthHeaders();
//             expect(headers.get('Authorization')).toBe('Bearer undefined');
//         });
//     });
// });
