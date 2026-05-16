function asyncHandler(handlerFunction){
    return (req, res, next) => {
        Promise.resolve(handlerFunction(req, res, next))
            .catch(next);
    };
}
    
export default asyncHandler;