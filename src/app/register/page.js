const Register = () => {
  return (
    <div className="signup-container">

      <div className="signup-left">
      
      </div>

     
      <div  className="signup-right">
       <h2>Create New Account</h2>
       <hr className="signup-line" />


        <form>
          <label>Please Enter Your Name</label>
          <input type="text" name="" required />


          <label>Please Enter Email</label>
          <input type="email" name="" placeholder="hello@reallygreatsite.com" required/>

          <label>Please Enter Password</label>
          <input type="password" name="" placeholder="••••••••" required/>

          <label>Please Comfirm Password</label>
          <input type="password" name="" placeholder="••••••••" required/>


          <button type="submit">SIGN UP</button>
        </form>

        <p className="signin">
          Already have an account? <span>Login</span>
        </p>

        <p className="brand">愉快</p>
      </div>

    </div>
  );
};

export default Register;