import { AuthServiceImpl } from "@domains/auth/service";
import { ExtendedUserDTO } from "@domains/user/dto";
import { UserRepositoryImplMock } from "@domains/user/repository";
import { encryptPassword } from "@utils";

const userRepository = new UserRepositoryImplMock();

const authService = new AuthServiceImpl(userRepository);

const signUpData = {
    email: "test@gmail.com",
    name: "Name",
    username: "Username",
    password: "PasswordN#1",
};

const logInData = {
    email: "test@gmail.com",
    username: "Username",
    password: "PasswordN#1",
}

const extendedUser = new ExtendedUserDTO({
    id: "0",
    biography: null,
    createdAt: new Date(),
    email: "test@gmail.com",
    image: null,
    name: null,
    password: "PasswordN#1",
    username: "Username",
    isPrivate: false
})

describe("AuthServiceImpl",()=>{
    beforeEach(() => {
        jest.clearAllMocks();
    });
    test("signUp_success",async ()=>{
        userRepository.getByEmailOrUsername.mockResolvedValue(null);
        userRepository.create.mockReturnValue(extendedUser);
        const token = await authService.signup(signUpData);

        expect(userRepository.create).toHaveBeenCalled()
        expect(userRepository.getByEmailOrUsername).toHaveBeenCalledWith("test@gmail.com","Username");
        expect(token.token).not.toBeNull();
    })
    test("signUp_existingUser_error",async ()=>{
        userRepository.getByEmailOrUsername.mockResolvedValue(extendedUser);

        await expect( authService.signup(signUpData)).rejects.toThrow();
    })
    test("logIn_sucess",async ()=>{
        extendedUser.password = await encryptPassword(signUpData.password);
        userRepository.getByEmailOrUsername.mockResolvedValue(extendedUser);
        const token = await authService.login(logInData);

        expect(userRepository.getByEmailOrUsername).toHaveBeenCalledWith("test@gmail.com", "Username");
        expect(token).toBeInstanceOf(Object);
        expect(token.token).not.toBeNull();
    })
    test("logIn_notExistingUser_error",async ()=>{
        userRepository.getByEmailOrUsername.mockResolvedValue(null);
        await expect(authService.login(logInData)).rejects.toThrow();
    })
    test("logIn_sucess",async ()=>{
        logInData.password = "errorMessage";
        extendedUser.password = logInData.password;
        userRepository.getByEmailOrUsername.mockResolvedValue(extendedUser);

        await expect(authService.login(logInData)).rejects.toThrow();
        expect(userRepository.getByEmailOrUsername).toHaveBeenCalledWith("test@gmail.com", "Username");
    })
})