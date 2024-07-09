Set objFSO = CreateObject("Scripting.FileSystemObject") 
Set objFile = objFSO.OpenTextFile("C:\Proyectos\FlashscoreScraping\src\csv\results\RESULTS_20240708133523_world_olympic-games.csv") 
matchIds = "" 
lineNum = 0 
Do Until objFile.AtEndOfStream 
    strLine = objFile.ReadLine 
    If lineNum  Then 
        arrFields = Split(strLine, ",") 
        If matchIds = "" Then 
            matchIds = arrFields(0) 
        Else 
            matchIds = matchIds & "," & arrFields(0) 
        End If 
    End If 
    lineNum = lineNum + 1 
Loop 
WScript.Echo matchIds 
objFile.Close 
