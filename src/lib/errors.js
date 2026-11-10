export class NotFoundError extends Error {}

export class ConflictError extends Error {

    constructor(message, fields) {
        super(message);
        this.fields= fields;
    }
}
