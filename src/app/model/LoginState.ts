export interface LoginState
{
    type: LoginStateType
    user?: string
    major?: string
    semester?: number
    subject?: string
    group?: number
}

export type LoginStateType = 
    "NOT_LOGGED" |
    "SUBJECT_NOT_CHOSEN" |
    "LOGGED"