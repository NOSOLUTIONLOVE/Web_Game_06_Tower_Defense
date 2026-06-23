/**
 * App - 根组件
 */

import { TowerDefenseGameRoot } from './components/TowerDefenseGame';

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 gap-6">
      <TowerDefenseGameRoot />
    </div>
  );
}

export default App;
