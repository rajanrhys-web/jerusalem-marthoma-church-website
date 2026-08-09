Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Rhys.Rajan\.gemini\antigravity\brain\356e1402-fb45-478d-9cc8-aa40fa401833\.user_uploaded\media_1786027755543.png"
$destPngPath = "C:\Users\Rhys.Rajan\.gemini\antigravity\scratch\st-thomas-mar-thoma-church\assets\church_logo.png"

$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
$width = $bmp.Width
$height = $bmp.Height

$newBmp = New-Object System.Drawing.Bitmap($width, $height)
$visited = New-Object 'bool[,]' $width, $height

# Copy original pixels
for ($x = 0; $x -lt $width; $x++) {
    for ($y = 0; $y -lt $height; $y++) {
        $newBmp.SetPixel($x, $y, $bmp.GetPixel($x, $y))
    }
}
$bmp.Dispose()

# Queue flood fill from outer border pixels
$queue = New-Object System.Collections.Generic.Queue[System.Drawing.Point]

function TryEnqueue($px, $py) {
    if ($px -ge 0 -and $px -lt $width -and $py -ge 0 -and $py -lt $height) {
        if (-not $visited[$px, $py]) {
            $c = $newBmp.GetPixel($px, $py)
            # Stop if red border or dark contour
            $isRedBorder = ($c.R -gt 160 -and $c.G -lt 80 -and $c.B -lt 80)
            if (-not $isRedBorder) {
                $visited[$px, $py] = $true
                $queue.Enqueue((New-Object System.Drawing.Point($px, $py)))
            }
        }
    }
}

# Seed top, bottom, left, right edges
for ($x = 0; $x -lt $width; $x++) {
    TryEnqueue $x 0
    TryEnqueue $x ($height - 1)
}
for ($y = 0; $y -lt $height; $y++) {
    TryEnqueue 0 $y
    TryEnqueue ($width - 1) $y
}

# Process BFS flood fill
while ($queue.Count -gt 0) {
    $pt = $queue.Dequeue()
    $newBmp.SetPixel($pt.X, $pt.Y, [System.Drawing.Color]::Transparent)

    $dx = @(1, -1, 0, 0)
    $dy = @(0, 0, 1, -1)
    for ($i = 0; $i -lt 4; $i++) {
        $nx = $pt.X + $dx[$i]
        $ny = $pt.Y + $dy[$i]
        if ($nx -ge 0 -and $nx -lt $width -and $ny -ge 0 -and $ny -lt $height) {
            if (-not $visited[$nx, $ny]) {
                $c = $newBmp.GetPixel($nx, $ny)
                $isRedBorder = ($c.R -gt 160 -and $c.G -lt 80 -and $c.B -lt 80)
                if (-not $isRedBorder) {
                    $visited[$nx, $ny] = $true
                    $queue.Enqueue((New-Object System.Drawing.Point($nx, $ny)))
                }
            }
        }
    }
}

$newBmp.Save($destPngPath, [System.Drawing.Imaging.ImageFormat]::Png)
$newBmp.Dispose()
Write-Host "Processed high-res logo transparent PNG successfully"
