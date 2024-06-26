import { SignupInputDTO, TokenDTO } from "@domains/auth/dto";
import { AuthServiceImpl } from "@domains/auth/service";
import { ExtendedUserDTO } from "@domains/user/dto";
import { UserRepositoryImplMock } from "@domains/user/repository";
import { encryptPassword } from "@utils";

const UserRepository = new UserRepositoryImplMock();

const authService = new AuthServiceImpl(UserRepository);

const signUpData: any = {
    email: "test@gmail.com",
    username: "Username",
    password: "PasswordN#1",
};

const logInData: any = {
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
    username: "Username"
})

describe("AuthServiceImpl",()=>{
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("",async ()=>{

    })
    test("signUp_success",async ()=>{
        UserRepository.getByEmailOrUsername.mockReturnValue(null);
        UserRepository.create.mockReturnValue(extendedUser);
        const token = await authService.signup(signUpData);

        expect(UserRepository.create).toHaveBeenCalled()
        expect(UserRepository.getByEmailOrUsername).toHaveBeenCalledWith("test@gmail.com","Username");
        expect(token.token).not.toBeNull();
    })
    test("signUp_existingUser_error",async ()=>{
        UserRepository.getByEmailOrUsername.mockReturnValue(extendedUser);

        expect(UserRepository.getByEmailOrUsername).toHaveBeenCalledWith(String,String);
        expect(await authService.signup(signUpData)).toThrow();
    })
    test("logIn_sucess",async ()=>{
        logInData.password = await encryptPassword(signUpData.password);
        extendedUser.password = logInData.password;
        UserRepository.getByEmailOrUsername.mockReturnValue(extendedUser);
        const token = await authService.login(logInData);

        expect(UserRepository.getByEmailOrUsername).toHaveBeenCalledWith(String,String);
        expect(token).toBe(TokenDTO);
        expect(token.token).not.toBeNull();
    })
    test("logIn_notExistingUser_error",async ()=>{
        UserRepository.getByEmailOrUsername.mockReturnValue(null);
        
        expect(UserRepository.getByEmailOrUsername).toHaveBeenCalledWith(String,String);
        expect(await authService.login(logInData)).toThrow();
    })
    test("logIn_sucess",async ()=>{
        logInData.password = "errorMessage";
        extendedUser.password = logInData.password;
        UserRepository.getByEmailOrUsername.mockReturnValue(extendedUser);

        expect(UserRepository.getByEmailOrUsername).toHaveBeenCalledWith(String,String);
        expect(await authService.login(logInData)).toThrow();
    })
})