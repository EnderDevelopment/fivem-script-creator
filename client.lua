local loadscreenReady = false
local shutdownRequested = false

RegisterNUICallback('ready', function(_, cb)
    loadscreenReady = true
    cb({ ok = true })
end)

RegisterNUICallback('shutdown', function(_, cb)
    if not shutdownRequested then
        shutdownRequested = true
        ShutdownLoadingScreenNui()
    end
    cb({ ok = true })
end)

CreateThread(function()
    while not NetworkIsSessionStarted() do
        if loadscreenReady then
            SendNUIMessage({ type = 'progress', value = 0.08 })
        end
        Wait(500)
    end

    if loadscreenReady then
        SendNUIMessage({ type = 'progress', value = 1 })
    end

    Wait(350)
    if not shutdownRequested then
        shutdownRequested = true
        ShutdownLoadingScreenNui()
    end
end)
