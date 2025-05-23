package com.aegis.network

class UDPHeader(private val packet: ByteArray, private val offset: Int) {
    val headerLength: Int
        get() = 8 // Fixed UDP header length

    val destinationPort: Int
        get() = ((packet[offset + 2].toUByte().toInt() shl 8) or
                 packet[offset + 3].toUByte().toInt())
}