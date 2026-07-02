import { Home } from "./pages/Home";
import { CustomCursor } from "./components/common/CustomCursor";
import { Chatbot } from "./components/common/Chatbot";

function App() {
  return (
    <>
      <CustomCursor />
      <Home />
      <Chatbot />
    </>
  );
}

export default App;
