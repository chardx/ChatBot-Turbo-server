import express from "express";
import { runScript } from "./app.js";
const app = express();
app.get("/", (req, res) => {
    res.write("Hello World!");
    res.write("Thinking of you");
    res.send();
    runScript();
});
app.listen(3000, () => {
    console.log("Listening on port 3000!");
});
//# sourceMappingURL=index.js.map