# Simple HTTP Server for MindfulMe
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:8080/')
$listener.Start()

Write-Host "MindfulMe is running at http://localhost:8080/"
Write-Host "Press Ctrl+C to stop the server"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # Get the requested URL
        $requestUrl = $request.Url.LocalPath
        
        # Default to index.html
        $filePath = "C:\Users\vaish\mindfulme-app\client\public\index.html"
        
        # Set content type
        $response.ContentType = 'text/html'
        
        # Read the file content
        $fileContent = [System.IO.File]::ReadAllBytes($filePath)
        
        # Set response length and write content
        $response.ContentLength64 = $fileContent.Length
        $response.OutputStream.Write($fileContent, 0, $fileContent.Length)
        
        # Close the response
        $response.Close()
        
        Write-Host "Request processed: $requestUrl"
    }
}
finally {
    $listener.Stop()
} 