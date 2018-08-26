import React from 'react'
import InputSection from '../containers/InputSection'
import MainSection from '../containers/MainSection'
import logo from '../logo.svg';
import '../App.css';

const App = () => (
    <div>
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <h1 className="App-title">Welcome to React</h1>
            </header>
            <section>
                <InputSection />
            </section>
            <div className='ablum py-5 bg-light'>
                <div className='container'>
                    <MainSection />
                </div>
            </div>

        </div>

    </div>
)

export default App