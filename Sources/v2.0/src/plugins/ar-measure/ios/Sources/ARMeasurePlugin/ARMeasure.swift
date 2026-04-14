import Foundation
import ARKit
import UIKit

@objc public class ARMeasure: NSObject {
    enum TrackingState: String {
        case not_started
        case initializing
        case tracking
        case limited
        case not_available
        case error
    }

    private let session = ARSession()
    private var isStarted: Bool = false

    @objc public func start() -> Bool {
        guard ARWorldTrackingConfiguration.isSupported else { return false }
        if isStarted { return true }

        let config = ARWorldTrackingConfiguration()
        config.planeDetection = [.horizontal, .vertical]
        if ARWorldTrackingConfiguration.supportsFrameSemantics(.sceneDepth) {
            config.frameSemantics.insert(.sceneDepth)
        }
        session.run(config, options: [.resetTracking, .removeExistingAnchors])
        isStarted = true
        return true
    }

    @objc public func stop() {
        session.pause()
        isStarted = false
    }

    @objc public func getCenterRaycastDistance() -> [String: Any] {
        guard isStarted else {
            return ["trackingState": TrackingState.not_started.rawValue, "distanceMeters": NSNull(), "reason": "no_session"]
        }
        guard let frame = session.currentFrame else {
            return ["trackingState": TrackingState.initializing.rawValue, "distanceMeters": NSNull(), "reason": "no_frame"]
        }

        switch frame.camera.trackingState {
        case .notAvailable:
            return ["trackingState": TrackingState.not_available.rawValue, "distanceMeters": NSNull(), "reason": "not_available"]
        case .limited(let reason):
            return ["trackingState": TrackingState.limited.rawValue, "distanceMeters": NSNull(), "reason": "\(reason)"]
        case .normal:
            break
        }

        let bounds = UIScreen.main.bounds
        let center = CGPoint(x: bounds.midX, y: bounds.midY)

        guard let query = frame.raycastQuery(from: center, allowing: .estimatedPlane, alignment: .any) else {
            return ["trackingState": TrackingState.tracking.rawValue, "distanceMeters": NSNull(), "reason": "no_query"]
        }
        let results = session.raycast(query)
        guard let first = results.first else {
            return ["trackingState": TrackingState.tracking.rawValue, "distanceMeters": NSNull(), "reason": "no_hit"]
        }

        let t = first.worldTransform.columns.3
        let dx = frame.camera.transform.columns.3.x - t.x
        let dy = frame.camera.transform.columns.3.y - t.y
        let dz = frame.camera.transform.columns.3.z - t.z
        let dist = sqrt(dx*dx + dy*dy + dz*dz)
        let intr = frame.camera.intrinsics
        let fx = intr.columns.0.x
        let fy = intr.columns.1.y
        let res = frame.camera.imageResolution
        return [
            "trackingState": TrackingState.tracking.rawValue,
            "distanceMeters": Double(dist),
            "fx": Double(fx),
            "fy": Double(fy),
            "imageWidth": Int(res.width),
            "imageHeight": Int(res.height)
        ]
    }
}
