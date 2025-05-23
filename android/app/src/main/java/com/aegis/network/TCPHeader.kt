package com.aegis.network

class TCPHeader(private val packet: ByteArray, private val offset: Int) {
    val headerLength: Int
        get() = ((packet[offset + 12].toUByte().toInt() shr 4) and 0x0F) * 4

    val destinationPort: Int
        get() = ((packet[offset].toUByte().toInt() shl 8) or
                 packet[offset + 1].toUByte().toInt())
}
