import Foundation
import Capacitor

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(ARMeasurePlugin)
public class ARMeasurePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "ARMeasurePlugin"
    public let jsName = "ARMeasure"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getCenterRaycastDistance", returnType: CAPPluginReturnPromise)
    ]
    private let implementation = ARMeasure()

    @objc func start(_ call: CAPPluginCall) {
        let started = implementation.start()
        call.resolve([
            "started": started,
            "platform": "ios"
        ])
    }

    @objc func stop(_ call: CAPPluginCall) {
        implementation.stop()
        call.resolve([
            "stopped": true
        ])
    }

    @objc func getCenterRaycastDistance(_ call: CAPPluginCall) {
        call.resolve(implementation.getCenterRaycastDistance())
    }
}
