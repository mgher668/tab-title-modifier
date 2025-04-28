/*
 * Tab Title Modifier - A Chrome extension that allows you to customize tab titles
 * Copyright (C) 2023 Tab Title Modifier Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { TitleProvider } from './contexts/TitleContext';
import { TitleInput } from './components/TitleInput';
import { SavedTitlesList } from './components/SavedTitlesList';

function App() {
  return (
    <TitleProvider>
      <div className="w-96 max-h-[600px] flex flex-col rounded-md bg-white text-slate-900 shadow-lg overflow-hidden border border-slate-200">
        <header className="p-4 bg-slate-100 border-b border-slate-200">
          <h1 className="text-lg font-semibold">Tab Title Modifier</h1>
        </header>
        
        <div className="flex-1 overflow-y-auto">
          <TitleInput />
          <hr className="border-slate-200" />
          <SavedTitlesList />
        </div>
      </div>
    </TitleProvider>
  );
}

export default App;
