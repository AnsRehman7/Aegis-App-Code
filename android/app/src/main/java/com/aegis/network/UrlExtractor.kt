package com.aegis.network

fun extractUrl(packet: ByteArray, dataOffset: Int): String {
    return try {
        when {
            isTlsClientHello(packet, dataOffset) -> extractSNI(packet, dataOffset)
            else -> extractHttpHost(packet, dataOffset)
        }
    } catch (e: Exception) {
        ""
    }
}

private fun isTlsClientHello(packet: ByteArray, offset: Int): Boolean {
    return packet.size > offset + 5 &&
            packet[offset].toInt() == 0x16 &&
            packet[offset + 5].toInt() == 0x01
}

private fun extractSNI(packet: ByteArray, offset: Int): String {
    var cursor = offset + 43
    if (packet.size <= cursor) return ""
    
    cursor += packet[cursor].toInt() + 1 // Session ID
    cursor += 2 // Cipher Suites
    cursor += packet[cursor].toInt() + 1 // Compression Methods
    
    if (packet.size > cursor + 2) {
        val extensionsLength = (packet[cursor].toInt() shl 8) or packet[cursor + 1].toInt()
        cursor += 2
        
        val end = cursor + extensionsLength
        while (cursor < end && cursor < packet.size - 4) {
            val extType = (packet[cursor].toInt() shl 8) or packet[cursor + 1].toInt()
            cursor += 2
            val extLength = (packet[cursor].toInt() shl 8) or packet[cursor + 1].toInt()
            cursor += 2
            
            if (extType == 0x0000) { // SNI Extension
                return parseSNIExtension(packet, cursor, extLength)
            }
            cursor += extLength
        }
    }
    return ""
}

private fun parseSNIExtension(packet: ByteArray, start: Int, length: Int): String {
    var cursor = start
    val end = start + length.coerceAtMost(packet.size - start)
    
    if (cursor + 3 > end) return ""
    cursor += 2 // Skip server name list length
    
    while (cursor < end) {
        val nameType = packet[cursor].toInt()
        cursor += 1
        val nameLen = (packet[cursor].toInt() shl 8) or packet[cursor + 1].toInt()
        cursor += 2
        
        if (nameType == 0x00) { // Hostname type
            return packet.copyOfRange(cursor, cursor + nameLen)
                .decodeToString()
                .replace(".", "_")
                .lowercase()
        }
        cursor += nameLen
    }
    return ""
}

// UrlExtractor.kt
private fun extractHttpHost(packet: ByteArray, dataOffset: Int): String {
    val data = String(packet, dataOffset, packet.size - dataOffset)
    return data.split("\\r\\n".toRegex())
        .firstOrNull { it.startsWith("Host:") }
        ?.substringAfter("Host:")
        ?.trim()
        ?.replace("www.", "")  // Add this line
        ?.replace(".", "_")
        ?.lowercase()
        ?: ""
}