class apiError extends Error {
    private status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }

    getStatus(): number {
        return this.status;
    }

    static badRequest(message: string) {
        return new apiError(400, message);
    }

    static unauthorized(message: string) {
        return new apiError(401, message);
    }

    static forbidden(message: string) {
        return new apiError(403, message);
    }

    static notFound(message: string) {
        return new apiError(404, message);
    }

    static iternal(message: string) {
        return new apiError(500, message);
    }
}

export default apiError;