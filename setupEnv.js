import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Make sure the variables are set in process.env
if (
  !process.env.SECRET_EVENTS_API_PASSWORD ||
  !process.env.SECRET_EVENTS_API_URL ||
  !process.env.SECRET_EVENTS_API_USERNAME ||
  !process.env.SECRET_LOAD_EVENTS
) {
  throw new Error("Missing necessary environment variables.");
}

// Export the variables to use in other files
export const {
  SECRET_EVENTS_API_PASSWORD,
  SECRET_EVENTS_API_URL,
  SECRET_EVENTS_API_USERNAME,
  SECRET_LOAD_EVENTS,
} = process.env;
