import { createRoot } from "react-dom/client";
import App from "../../src/App.jsx";
createRoot(document.getElementById("root")).render(<><App /><div style={{position:"fixed",bottom:10,left:10,zIndex:2000,background:"#182334",color:"white",padding:"7px 12px",borderRadius:6,fontSize:12}}>Offline preview · sample data · no emails sent</div></>);
