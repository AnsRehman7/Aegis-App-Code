package com.aegis.network

class IPHeader(private val packet: ByteArray, private val offset: Int) {
    val headerLength: Int
        get() = (packet[offset].toInt() and 0x0F) * 4

    val protocol: Int
        get() = packet[offset + 9].toUByte().toInt()

    val sourceAddress: String
        get() = "${packet[offset + 12].toUByte()}.${packet[offset + 13].toUByte()}." +
                "${packet[offset + 14].toUByte()}.${packet[offset + 15].toUByte()}"

    val destinationAddress: String
        get() = "${packet[offset + 16].toUByte()}.${packet[offset + 17].toUByte()}." +
                "${packet[offset + 18].toUByte()}.${packet[offset + 19].toUByte()}"

    companion object {
        const val TCP = 6
        const val UDP = 17
    }
}