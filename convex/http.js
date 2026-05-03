import { httpRouter } from "./_generated/server";
import { sendOrderNotification } from "./telegram";

const http = httpRouter();

// Route: POST /telegram-notify
http.route("/telegram-notify", sendOrderNotification);

export default http;