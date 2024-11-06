import { Routes } from '@angular/router';
import { DebugComponent } from './pages/debug/debug.component';
import { GradesComponent } from './pages/grades/grades.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/grades',
        pathMatch: 'full'
    },
    {
        path: 'debug',
        component: DebugComponent,
        title: "Debug panel",
    },
    {
        path: 'grades',
        component: GradesComponent,
        title: "Grades",
    }
];
