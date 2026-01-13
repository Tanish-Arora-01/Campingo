const e = require("express");

class ExpressError extends Error{
    constructor(message,status){
        super();
        this.message=message;
        this.statusCode=status;
    }
}
module.exports=ExpressError;