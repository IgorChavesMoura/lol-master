import React from 'react';

import {
    withRouter
  } from 'react-router-dom'

import './login.css';


class Login extends React.Component {



    constructor(){
        super();

        this.state = { summoner:'' };

    }

    handleSubmit =  async  (event) => {

        event.preventDefault();
    
        this.props.history.push(`/home?summoner=${this.state.summoner}`);

    }

    render(){

        return (
            <form onSubmit={this.handleSubmit} id="form-container">
                <div id="userCredecials">
                    <div>
                        <input id="invokerName" type="text" value={this.state.summoner} onChange={e => this.setState({ summoner:e.target.value })} placeholder="Nome do Invocador"/>
                    </div>
                    <div>
                        <select id="server">
                            <option value="1">BR</option>
                            <option value="2">EU</option>
                            <option value="3">NA</option>
                            <option value="4">KR</option>
                            <option value="5">OC</option>
                        </select>  
                    </div>
                    
                    
                </div>            
                <button type="submit" id="confirm">Entrar</button>
            </form>
        );  

    }

}

export default withRouter(Login);