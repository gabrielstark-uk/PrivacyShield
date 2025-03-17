// This file handles redirects from old API endpoints to new ones

export default function handler(req, res) {
  return res.status(301).json({
    message: "This API endpoint has been moved to /mock-api/. Please update your requests.",
    redirectTo: "/mock-api" + req.url
  });
}