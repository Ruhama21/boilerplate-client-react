import React, { FC } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'

const LoginKey: { [P in keyof ILogin]: P } = {
  username: 'username',
  password: 'password',
}

const lowercaseRegex = /(?=.*[a-z])/
const uppercaseRegex = /(?=.*[A-Z])/
const numericRegex = /(?=.*[0-9])/
const specialCharRegex = /(?=.*\W)/

const loginSchema: yup.SchemaOf<ILogin> = yup.object().shape({
  username: yup.string().min(6, 'Username must be at least 6 characters.').required(),
  // password will be verified from backend for login, but the lines below are to demonstrate how Yup validation is working, and will be removed in next PR.
  password: yup
    .string() // Must contain at least 1 uppercase character
    .matches(uppercaseRegex, 'One upper case character required.')
    // Must contain at least 1 lowercase character
    .matches(lowercaseRegex, 'One lower case character required.')
    // Must contain at least 1 numeric character
    .matches(numericRegex, 'One number is required.')
    // Must contain at least 1 special character
    .matches(specialCharRegex, 'One special character is required.')
    .min(8, 'Minimum 8 character required.')
    .required('Password is required.'),
})

interface ILogin {
  username: string
  password: string
}

const useLoginForm = () =>
  useForm<ILogin>({
    // validationSchema: loginSchema,
  })

export const LoginForm: FC = () => {
  const { register, errors, handleSubmit } = useLoginForm()

  const onSubmit = handleSubmit((data) => {
    // eslint-disable-next-line no-console
    console.log(data)
  })

  return (
    <form className="login-form form" onSubmit={onSubmit}>
      <div className="form__control">
        <label htmlFor="username">
          <span>Username</span>
          <input type="text" name={LoginKey.username} ref={register} />
        </label>
        {errors.username && <p className="form__error">{errors.username.message}</p>}
      </div>

      <div className="form__control">
        <label htmlFor="password">
          <span>Password</span>
          <input type="password" name={LoginKey.password} ref={register} />
        </label>
        {errors.password && <p className="form__error">{errors.password.message}</p>}
      </div>

      <div className="form__control">
        <button type="submit">Submit</button>
      </div>
    </form>
  )
}
