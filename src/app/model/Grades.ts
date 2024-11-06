export interface Grades
{
    list: Grade[]

    // Średnia
    average: number

    // Zaliczenie
    total: number
}

export interface Grade
{
    // Ćwiczenie
    name: string

    // Termin [12]
    terms: number[]

    // Sprawdzian
    average: number

    // Obecność
    presence: boolean

    // Sprawozdanie
    report: any

    // Zaliczenie ćwiczenia
    total: number
}