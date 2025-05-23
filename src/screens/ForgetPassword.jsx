import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView
} from 'react-native';
import React from 'react'

const ForgetPassword = ({navigation}) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Forget Password</Text>

            </View>

            <View style={styles.bottomSection}>
                <Text style={{fontSize:22, fontWeight:700}}>Reset Your Password</Text>
                <Text style={{fontSize:14, fontWeight:400, marginTop:10}}>Please enter your email address to receive a password reset link.</Text>
                <Text style={styles.label}>Enter Your Email</Text>
                <TextInput
                    placeholder="example@example.com"
                    placeholderTextColor="#9DA3A4"
                    style={styles.input}
                />
                <TouchableOpacity style={{backgroundColor:'#00C18D', padding:12, borderRadius:25, marginTop:20}} onPress={()=>navigation.navigate('ChangePassword')}>
                    <Text style={{color:'#fff', fontSize:16, fontWeight:700, textAlign:'center'}}>Send Reset Link</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>

    )
}

export default ForgetPassword;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#00C18D',
    },
    header: {
        height:200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
    },
    bottomSection: {
        flex: 3,
        backgroundColor: '#EAF9F1',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        padding: 25,
      },
      input: {
      
        backgroundColor: '#D5EEDA',
        padding: 12,
        borderRadius: 25,
        color: '#000',
        fontSize: 14,
      },
      label: {
        marginTop:100,
        fontSize: 14,
        color: '#000',
        fontWeight: '600',
        marginBottom: 5,
      },
})