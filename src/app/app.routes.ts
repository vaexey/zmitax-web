import { Routes } from '@angular/router';
import { DebugComponent } from './pages/debug/debug.component';

export const routes: Routes = [
    {
        path: 'debug',
        component: DebugComponent,
        title: "Debug panel"
    }
];
