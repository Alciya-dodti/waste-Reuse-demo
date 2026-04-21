import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

export function trackVisit(serviceName) {
  console.log("User visited:", serviceName);
}

export default API;