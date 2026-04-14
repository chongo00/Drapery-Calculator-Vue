package com.blindsbook.plugins.armeasure

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.annotation.CapacitorPlugin
import com.getcapacitor.PluginMethod

@CapacitorPlugin(name = "ARMeasure")
class ARMeasurePlugin : Plugin() {

    private val implementation = ARMeasure()

    @PluginMethod
    fun start(call: PluginCall) {
        val started = implementation.start(activity)
        val ret = JSObject().apply {
            put("started", started)
            put("platform", "android")
        }
        call.resolve(ret)
    }

    @PluginMethod
    fun stop(call: PluginCall) {
        implementation.stop()
        val ret = JSObject().apply { put("stopped", true) }
        call.resolve(ret)
    }

    @PluginMethod
    fun getCenterRaycastDistance(call: PluginCall) {
        val result = implementation.getCenterRaycastDistance()
        val ret = JSObject().apply {
            put("trackingState", result.trackingState)
            put("distanceMeters", result.distanceMeters)
            if (result.fx != null) put("fx", result.fx)
            if (result.fy != null) put("fy", result.fy)
            if (result.imageWidth != null) put("imageWidth", result.imageWidth)
            if (result.imageHeight != null) put("imageHeight", result.imageHeight)
            if (result.reason != null) put("reason", result.reason)
        }
        call.resolve(ret)
    }
}
