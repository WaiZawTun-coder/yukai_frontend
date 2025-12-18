const Login = () => {
  return (
    <div className="login-wrapper">

      <div className="login-left">
        <img src="./Images/loginphoto1.jpg" alt="loginphoto1.jpg" className="icon-img"></img>
         <img src="./Images/loginphoto2.jpg" alt="loginphoto2.jpg" className="people-img"></img>
      
      </div>

     
      <div className="login-right">
       <h2>Login</h2>
       <hr className="login-line" />


        <form>
          <label>Please Enter Email</label>
          <input type="email" placeholder="hello@reallygreatsite.com" />

          <label>Please Enter Password</label>
          <input type="password" placeholder="********" />

          <a href="#" className="forgot">forgot password?</a>

          <button type="submit">LOGIN</button>
        </form>

        <p className="signup">
          Don’t have an account? <span>signup</span>
        </p>

        <p className="brand">yukai</p>
      </div>

    </div>
  );
};

export default Login;
