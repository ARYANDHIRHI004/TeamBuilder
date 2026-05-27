import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";

const registerUser = asyncHandler(async (req: Request, res: any) => {
    return res.status(200).json(
        new ApiResponse(200, "User registered successfully", {name: "John Doe"})
    )
});

export {
    registerUser
}