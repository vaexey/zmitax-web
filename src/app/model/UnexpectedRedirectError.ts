export class UnexpectedRedirectError extends Error
{
    constructor(
        msg?: string | null,
        public location?: string | null
    ) {
        super(msg ?? "Unexpected redirect")
    }
}