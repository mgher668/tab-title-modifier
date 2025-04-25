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
