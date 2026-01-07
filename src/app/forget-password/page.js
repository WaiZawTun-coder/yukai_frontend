import { Password } from '@mui/icons-material';
import '../css/forget-password.css';
const ForgetPassword = () =>{
    return (
        <div className="page-wrapper">
            <div className="card">
                <div className="header">
                    <h2>Forgot Password</h2>
                </div>
                <div className="content">
                    <div className="outer-box">
                        <div className="inner-box">
                            <form className="forget-form">
                                <label>Please enter Email</label>
                                <input type="email" className="email-input" placeholder="hello@reallygreatsite.com" />
                                <button type="submit" className="send-btn">SEND CODE</button> 
                            </form>
                            </div>
                    </div>
                </div>
                <div className="back-link-container"><a href="/login" className="back-text-link">{"<<Back"}</a></div>
                <div className="footer-logo">
                    <span>yukai</span>
                    <h3>愉快</h3>
                </div>
            </div>
        </div>
    );
};

    
export default ForgetPassword;