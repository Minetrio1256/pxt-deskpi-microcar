/**
 * Robot motor control + OLED display
 */
//% color=190 icon="\uf1b9" block="Robot"
namespace robot {

    // =======================
    // MOTOR CONTROL
    // =======================

    export enum Motor {
        //% block="Left"
        Left,
        //% block="Right"
        Right
    }

    export enum Direction {
        //% block="Forward"
        Forward,
        //% block="Backward"
        Backward,
        //% block="Stop"
        Stop
    }

    /**
     * Sets the direction of a motor
     */
    //% block="motor %motor direction %direction"
    export function setMotor(motor: Motor, direction: Direction): void {

        let forwardPin: DigitalPin
        let backwardPin: DigitalPin

        if (motor == Motor.Left) {
            forwardPin = DigitalPin.P14
            backwardPin = DigitalPin.P13
        } else {
            forwardPin = DigitalPin.P16
            backwardPin = DigitalPin.P15
        }

        switch (direction) {
            case Direction.Forward:
                pins.digitalWritePin(forwardPin, 1)
                pins.digitalWritePin(backwardPin, 0)
                break
            case Direction.Backward:
                pins.digitalWritePin(forwardPin, 0)
                pins.digitalWritePin(backwardPin, 1)
                break
            case Direction.Stop:
                pins.digitalWritePin(forwardPin, 0)
                pins.digitalWritePin(backwardPin, 0)
                break
        }
    }

    // =======================
    // OLED SSD1306 (128x64)
    // =======================

    const OLED_ADDR = 0x3C
    let initialized = false

    /**
     * Initializes the OLED screen
     */
    //% block="initialize OLED screen"
    export function initOLED(): void {
        if (initialized) return

        sendCommand(0xAE)
        sendCommand(0xA8); sendCommand(0x3F)
        sendCommand(0xD3); sendCommand(0x00)
        sendCommand(0x40)
        sendCommand(0xA1)
        sendCommand(0xC8)
        sendCommand(0xDA); sendCommand(0x12)
        sendCommand(0x81); sendCommand(0x7F)
        sendCommand(0xA4)
        sendCommand(0xA6)
        sendCommand(0xD5); sendCommand(0x80)
        sendCommand(0x8D); sendCommand(0x14)
        sendCommand(0xAF)

        clearOLED()
        initialized = true
    }

    /**
     * Clears the OLED screen
     */
    //% block="clear OLED screen"
    export function clearOLED(): void {
        for (let page = 0; page < 8; page++) {
            setPage(page)
            for (let col = 0; col < 128; col++) {
                sendData(0x00)
            }
        }
    }

    /**
     * Displays text on a line (0–7)
     */
    //% block="show %text at line %line"
    export function showText(text: string, line: number): void {
        if (!initialized) initOLED()
        setPage(line)

        for (let i = 0; i < text.length; i++) {
            let c = text.charCodeAt(i)
            if (c < 32 || c > 127) c = 32
            drawChar(c - 32)
        }
    }

    // =======================
    // INTERNAL FUNCTIONS
    // =======================

    function sendCommand(cmd: number): void {
        pins.i2cWriteBuffer(OLED_ADDR, pins.createBufferFromArray([0x00, cmd]))
    }

    function sendData(data: number): void {
        pins.i2cWriteBuffer(OLED_ADDR, pins.createBufferFromArray([0x40, data]))
    }

    function setPage(page: number): void {
        sendCommand(0xB0 + page)
        sendCommand(0x00)
        sendCommand(0x10)
    }

    function drawChar(c: number): void {
        for (let i = 0; i < 5; i++) {
            sendData(font[c * 5 + i])
        }
        sendData(0x00)
    }

    // =======================
    // 5x7 ASCII FONT (32–127)
    // =======================

    const font: number[] = [
        0x00, 0x00, 0x00, 0x00, 0x00, // space
        0x00, 0x00, 0x5F, 0x00, 0x00, // !
        0x00, 0x07, 0x00, 0x07, 0x00, // "
        0x14, 0x7F, 0x14, 0x7F, 0x14, // #
        0x24, 0x2A, 0x7F, 0x2A, 0x12, // $
        0x23, 0x13, 0x08, 0x64, 0x62, // %
        0x36, 0x49, 0x55, 0x22, 0x50, // &
        0x00, 0x05, 0x03, 0x00, 0x00, // '
        0x00, 0x1C, 0x22, 0x41, 0x00, // (
        0x00, 0x41, 0x22, 0x1C, 0x00, // )
        0x14, 0x08, 0x3E, 0x08, 0x14, // *
        0x08, 0x08, 0x3E, 0x08, 0x08, // +
        0x00, 0x50, 0x30, 0x00, 0x00, // ,
        0x08, 0x08, 0x08, 0x08, 0x08, // -
        0x00, 0x60, 0x60, 0x00, 0x00, // .
        0x20, 0x10, 0x08, 0x04, 0x02, // /
        0x3E, 0x51, 0x49, 0x45, 0x3E, // 0
        0x00, 0x42, 0x7F, 0x40, 0x00, // 1
        0x42, 0x61, 0x51, 0x49, 0x46, // 2
        0x21, 0x41, 0x45, 0x4B, 0x31, // 3
        0x18, 0x14, 0x12, 0x7F, 0x10, // 4
        0x27, 0x45, 0x45, 0x45, 0x39, // 5
        0x3C, 0x4A, 0x49, 0x49, 0x30, // 6
        0x01, 0x71, 0x09, 0x05, 0x03, // 7
        0x36, 0x49, 0x49, 0x49, 0x36, // 8
        0x06, 0x49, 0x49, 0x29, 0x1E, // 9
        0x00, 0x36, 0x36, 0x00, 0x00, // :
        0x00, 0x56, 0x36, 0x00, 0x00, // ;
        0x08, 0x14, 0x22, 0x41, 0x00, // <
        0x14, 0x14, 0x14, 0x14, 0x14, // =
        0x00, 0x41, 0x22, 0x14, 0x08, // >
        0x02, 0x01, 0x51, 0x09, 0x06,  // ?
        0x32, 0x49, 0x79, 0x41, 0x3E, // @
        0x7E, 0x11, 0x11, 0x11, 0x7E, // A
        0x7F, 0x49, 0x49, 0x49, 0x36, // B
        0x3E, 0x41, 0x41, 0x41, 0x22, // C
        0x7F, 0x41, 0x41, 0x22, 0x1C, // D
        0x7F, 0x49, 0x49, 0x49, 0x41, // E
        0x7F, 0x09, 0x09, 0x09, 0x01, // F
        0x3E, 0x41, 0x49, 0x49, 0x7A, // G
        0x7F, 0x08, 0x08, 0x08, 0x7F, // H
        0x00, 0x41, 0x7F, 0x41, 0x00, // I
        0x20, 0x40, 0x41, 0x3F, 0x01, // J
        0x7F, 0x08, 0x14, 0x22, 0x41, // K
        0x7F, 0x40, 0x40, 0x40, 0x40, // L
        0x7F, 0x02, 0x0C, 0x02, 0x7F, // M
        0x7F, 0x04, 0x08, 0x10, 0x7F, // N
        0x3E, 0x41, 0x41, 0x41, 0x3E, // O
        0x7F, 0x09, 0x09, 0x09, 0x06, // P
        0x3E, 0x41, 0x51, 0x21, 0x5E, // Q
        0x7F, 0x09, 0x19, 0x29, 0x46, // R
        0x46, 0x49, 0x49, 0x49, 0x31, // S
        0x01, 0x01, 0x7F, 0x01, 0x01, // T
        0x3F, 0x40, 0x40, 0x40, 0x3F, // U
        0x1F, 0x20, 0x40, 0x20, 0x1F, // V
        0x3F, 0x40, 0x38, 0x40, 0x3F, // W
        0x63, 0x14, 0x08, 0x14, 0x63, // X
        0x07, 0x08, 0x70, 0x08, 0x07, // Y
        0x61, 0x51, 0x49, 0x45, 0x43, // Z
        0x00, 0x7F, 0x41, 0x41, 0x00, // [
        0x02, 0x04, 0x08, 0x10, 0x20, // \
        0x00, 0x41, 0x41, 0x7F, 0x00, // ]
        0x04, 0x02, 0x01, 0x02, 0x04, // ^
        0x40, 0x40, 0x40, 0x40, 0x40, // _
        0x00, 0x01, 0x02, 0x04, 0x00, // `
        0x20, 0x54, 0x54, 0x54, 0x78, // a
        0x7F, 0x48, 0x44, 0x44, 0x38, // b
        0x38, 0x44, 0x44, 0x44, 0x20, // c
        0x38, 0x44, 0x44, 0x48, 0x7F, // d
        0x38, 0x54, 0x54, 0x54, 0x18, // e
        0x08, 0x7E, 0x09, 0x01, 0x02, // f
        0x0C, 0x52, 0x52, 0x52, 0x3E, // g
        0x7F, 0x08, 0x04, 0x04, 0x78, // h
        0x00, 0x44, 0x7D, 0x40, 0x00, // i
        0x20, 0x40, 0x44, 0x3D, 0x00, // j
        0x7F, 0x10, 0x28, 0x44, 0x00, // k
        0x00, 0x41, 0x7F, 0x40, 0x00, // l
        0x7C, 0x04, 0x18, 0x04, 0x78, // m
        0x7C, 0x08, 0x04, 0x04, 0x78, // n
        0x38, 0x44, 0x44, 0x44, 0x38, // o
        0x7C, 0x14, 0x14, 0x14, 0x08, // p
        0x08, 0x14, 0x14, 0x18, 0x7C, // q
        0x7C, 0x08, 0x04, 0x04, 0x08, // r
        0x48, 0x54, 0x54, 0x54, 0x20, // s
        0x04, 0x3F, 0x44, 0x40, 0x20, // t
        0x3C, 0x40, 0x40, 0x20, 0x7C, // u
        0x1C, 0x20, 0x40, 0x20, 0x1C, // v
        0x3C, 0x40, 0x30, 0x40, 0x3C, // w
        0x44, 0x28, 0x10, 0x28, 0x44, // x
        0x0C, 0x50, 0x50, 0x50, 0x3C, // y
        0x44, 0x64, 0x54, 0x4C, 0x44, // z
        0x00, 0x08, 0x36, 0x41, 0x00, // {
        0x00, 0x00, 0x7F, 0x00, 0x00, // |
        0x00, 0x41, 0x36, 0x08, 0x00, // }
        0x08, 0x08, 0x2A, 0x1C, 0x08, // ~
        0x00, 0x00, 0x00, 0x00, 0x00  // DEL
    ]

    let strip: neopixel.Strip = null

    /**
     * Initializes the LED strip (4 LEDs on P6)
     */
    //% block="initialize LED strip"
    export function initLED(): void {
        if (!strip) {
            strip = neopixel.create(DigitalPin.P6, 4, NeoPixelMode.RGB)
            strip.clear()
            strip.show()
        }
    }

    /**
     * Sets the RGB LED using the color picker
     */
    //% block="LED RGB %index to color %color"
    //% color.shadow="colorNumberPicker"
    export function setLEDColor(index: number, color: number): void {
        if (!strip) initLED()
        if (index < 0 || index > 3) return
        led.enable(false)
        strip.setPixelColor(index, color)
        strip.show()
        led.enable(true)
    }

    /**
     * Sets the RGB LED with manual R,G,B values
     */
    //% block="LED RGB %index to R %r G %g B %b"
    export function setLEDManual(index: number, r: number, g: number, b: number): void {
        if (!strip) initLED()
        if (index < 0 || index > 3) return
        led.enable(false)
        strip.setPixelColor(index, neopixel.rgb(r, g, b))
        strip.show()
        led.enable(true)
    }

    /**
     * Clears all LEDs
     */
    //% block="clear all LEDs"
    export function clearLED(): void {
        if (!strip) return
        strip.clear()
        strip.show()
    }

    /**
     * Reads the volume on P3 and maps it from 0 to 100
     */
    //% block="volume on P3 (0-100)"
    export function readVolume(): number {
        let val = pins.analogReadPin(AnalogPin.P3)
        return val
    }

    /**
 * Reads the left optical sensor
 */
    //% block="left optical sensor"
    export function leftSensor(): number {
        return pins.analogReadPin(AnalogPin.P4)  // 0–1023
    }

    /**
     * Reads the right optical sensor
     */
    //% block="right optical sensor"
    export function rightSensor(): number {
        return pins.analogReadPin(AnalogPin.P0)  // 0–1023
    }

    /**
     * Reads the right button
     */
    //% block="right button"
    export function rightButton(): boolean {
        return pins.digitalReadPin(DigitalPin.P5) === 0
    }

    /**
     * Reads the left button
     */
    //% block="left button"
    export function leftButton(): boolean {
        return pins.digitalReadPin(DigitalPin.P11) === 0
    }

    /**
 * Reads the left grey sensor
 */
    //% block="left grey sensor"
    export function leftGrey(): number {
        return pins.analogReadPin(AnalogPin.P2)
    }

    /**
     * Reads the right grey sensor
     */
    //% block="right grey sensor"
    export function rightGrey(): number {
        return pins.analogReadPin(AnalogPin.P1)
    }

    /**
     * Reads the left grey sensor as percentage (0–100)
     */
    //% block="left grey sensor %type"
    //% type.defl="percentage"
    export function leftGreyPercent(): number {
        return Math.map(leftGrey(), 0, 1023, 0, 100)
    }

    /**
     * Reads the right grey sensor as percentage (0–100)
     */
    //% block="right grey sensor %type"
    //% type.defl="percentage"
    export function rightGreyPercent(): number {
        return Math.map(rightGrey(), 0, 1023, 0, 100)
    }

    /**
     * Reads the ultrasonic sensor distance in centimeters
     */
    //% block="ultrasonic distance cm"
    export function getUltrasonicDistanceCM(): number {
        const echoPin = DigitalPin.P9      // Echo on P9
        const triggerPin = DigitalPin.P12  // Trigger on P12

        // Make sure trigger is low
        pins.digitalWritePin(triggerPin, 0)
        control.waitMicros(2)

        // Send 10µs trigger pulse
        pins.digitalWritePin(triggerPin, 1)
        control.waitMicros(10)
        pins.digitalWritePin(triggerPin, 0)

        // Measure echo pulse (timeout ≈ 4m)
        let duration = pins.pulseIn(echoPin, PulseValue.High, 25000)

        // Convert microseconds to centimeters
        return duration / 58
    }

    // =======================
    // IR RECEIVER (Pin 7)
    // =======================

    let lastIRCode: number = 0

    /**
     * Detects if IR signal is received
     */
    //% block="IR signal received"
    export function isIRReceived(): boolean {
        let pulseWidth = pins.pulseIn(DigitalPin.P7, PulseValue.Low, 100000)
        return pulseWidth > 0
    }

    /**
     * Gets the last IR button code
     */
    //% block="IR button code"
    export function getIRCode(): number {
        return lastIRCode
    }

    /**
     * Reads IR signal and updates code
     */
    //% block="read IR signal"
    export function readIRSignal(): number {
        let code = 0
        // Pulse in on P7 to detect IR signal
        let pulseWidth = pins.pulseIn(DigitalPin.P7, PulseValue.Low, 100000)
        
        code = pulseWidth / 1000  // Raw code
        
        lastIRCode = code
        return code
    }
}