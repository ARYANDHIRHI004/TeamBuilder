class ApiResponse {
    
    status: Number;
    message: String;
    data: any;
    constructor(status:Number, message:String, data:any) {
        this.status = status;
        this.message = message;
        this.data = data;
    }
}

export default ApiResponse;