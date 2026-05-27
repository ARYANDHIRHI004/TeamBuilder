function asyncHandler(handlerFunction: any) {
    return (req: any, res: any, next: any) => {
        Promise.resolve(handlerFunction(req, res, next))
            .catch(next);
    };
}
    
export default asyncHandler;