package com.blindsbook.plugins.armeasure

import android.app.Activity
import com.google.ar.core.ArCoreApk
import com.google.ar.core.Frame
import com.google.ar.core.HitResult
import com.google.ar.core.Session
import com.google.ar.core.TrackingState
import kotlin.math.sqrt

class ARMeasure {

    data class RaycastResult(
        val trackingState: String,
        val distanceMeters: Double?,
        val fx: Double?,
        val fy: Double?,
        val imageWidth: Int?,
        val imageHeight: Int?,
        val reason: String?
    )

    private var session: Session? = null
    private var lastFrame: Frame? = null

    fun start(activity: Activity?): Boolean {
        if (activity == null) return false
        if (session != null) return true
        val availability = ArCoreApk.getInstance().checkAvailability(activity)
        if (!availability.isSupported) return false
        session = Session(activity)
        return true
    }

    fun stop() {
        try {
            session?.close()
        } catch (_: Throwable) {
        } finally {
            session = null
            lastFrame = null
        }
    }

    /**
     * Best-effort: requires the host app to drive Session.update() on each camera frame.
     * In a real integration we'd run an AR view. For now we return not_available unless
     * a frame is injected.
     */
    fun getCenterRaycastDistance(): RaycastResult {
        val s = session ?: return RaycastResult("not_started", null, null, null, null, null, "no_session")
        val frame = try { s.update() } catch (_: Throwable) { null }
        if (frame == null) return RaycastResult("initializing", null, null, null, null, null, "no_frame")
        lastFrame = frame
        val camera = frame.camera
        if (camera.trackingState != TrackingState.TRACKING) {
            return RaycastResult("limited", null, null, null, null, null, camera.trackingState.name.lowercase())
        }
        val intr = frame.camera.imageIntrinsics
        val dims = intr.imageDimensions
        val w = dims[0]
        val h = dims[1]
        val cx = w / 2f
        val cy = h / 2f
        val hits: List<HitResult> = frame.hitTest(cx, cy)
        val hit = hits.firstOrNull() ?: return RaycastResult("tracking", null, intr.focalLength[0].toDouble(), intr.focalLength[1].toDouble(), w, h, "no_hit")
        val pose = hit.hitPose
        val tx = pose.tx()
        val ty = pose.ty()
        val tz = pose.tz()
        val dist = sqrt((tx * tx + ty * ty + tz * tz).toDouble())
        return RaycastResult(
            "tracking",
            dist,
            intr.focalLength[0].toDouble(),
            intr.focalLength[1].toDouble(),
            w,
            h,
            null
        )
    }

    fun setLastFrame(frame: Frame) {
        lastFrame = frame
    }
}
