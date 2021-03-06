import React, { Component, Fragment } from 'react'
import {withRouter} from 'react-router';
import taskStore from '../../reducer/taskReducer';
import Navbar from '../utils/Navbar';
import './Student.css';

class Student extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tasks: [],
            level: 'Beginner',
            studentName: '',
            token: null
        };
    }

    componentDidMount() {
        this.unsubscribe = taskStore.subscribe(() => this.handleStateChange(taskStore)); //subscription to store
        const token = taskStore.getState().authObj.token;
        let tokensplit = '';
        if(token) {
            tokensplit = token.split("-");
        }
        this.setState({
            tasks: [...taskStore.getState().taskList],
            studentName: tokensplit[0],
            token: token
        });
    }

    //callback to handle change in redux store
    handleStateChange = (store) => {
        console.log(store.getState().taskList);
        this.setState({
            tasks: [...store.getState().taskList]
        });
    }

    handleLevelChange = (e) => {
        this.setState({
            level: e.target.value
        });
    }

    handleRoute = (option) => {
        if(option === 'home') {
            this.props.history.push('/');
        }
    }

    handleUpdate = (id,uploadedsolution) => {
        const taskList = this.state.tasks;
        if(this.state.level === 'Beginner') {
            for(let i=0;i<taskList[0].tasks.length;i++) {
                if(taskList[0].tasks[i].id === id) {
                    taskList[0].tasks[i].submissions.push({studentName: this.state.studentName, imageuri: uploadedsolution, isChecked: false, score: null});
                }
            }
        } else if(this.state.level === 'Intermediate') {
            for(let i=0;i<taskList[1].tasks.length;i++) {
                if(taskList[1].tasks[i].id === id) {
                    taskList[1].tasks[i].submissions.push({studentName: this.state.studentName, imageuri: uploadedsolution, isChecked: false, score: null});
                }
            }
        } else {
            for(let i=0;i<taskList[2].tasks.length;i++) {
                if(taskList[2].tasks[i].id === id) {
                    taskList[2].tasks[i].submissions.push({studentName: this.state.studentName, imageuri: uploadedsolution, isChecked: false, score: null});
                }
            }
        }
        this.setState({
            tasks: [...taskList]
        });
        taskStore.dispatch({type: 'UPDATE_TASK', taskList: taskList});
    }

    handleSubmit = (id) => {
        let uploadedsolution = '';
        const file = document.getElementById("uploadsolution"+id).files[0];
        if(file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                uploadedsolution = reader.result;
                if(uploadedsolution) {
                    this.handleUpdate(id,uploadedsolution);
                }
            };
            reader.readAsDataURL(file);
        }
    }
    render() {
        const displayTasks = [];
        if(this.state.tasks.length>0) {
            let taskList = [];
            if(this.state.level === 'Beginner') {
                taskList = [...this.state.tasks[0].tasks];
            } else if(this.state.level === 'Intermediate') {
                taskList = [...this.state.tasks[1].tasks];
            } else {
                taskList = [...this.state.tasks[2].tasks];
            }
            taskList.forEach(element => {
                if(element.submissions.length===0) {
                    displayTasks.push(element);
                } else {
                    let found = false;
                    for(let i=0; i<element.submissions.length; i++) {
                        if(element.submissions[i].studentName === this.state.studentName) {
                            found = true;
                            break;
                        }
                    }
                    if(!found) {
                        displayTasks.push(element);
                    }
                }
            });
        }
        let elem = <p>There are no tasks to complete...</p>;
        if(displayTasks.length > 0) {
            elem = (
                displayTasks.map(task => {
                    return (
                        <div className="student-tasks-container" key={task.id}>
                            <div className="student-tasks row">
                                <div className="student-tasks-name col-4">Task Name:<br/> {task.taskname}</div>
                                <div className="student-tasks-instructions col-4"> Task Instructions:<br/> {task.instructions}</div>
                                <div className="student-tasks-img col-4">
                                    <a href={task.imageuri} download={"Task_"+task.level+"_"+task.id+".jpg"}>
                                        <img src={task.imageuri} alt="Preview"/>
                                    </a>
                                </div>
                            </div>
                            <div className="student-tasks-btn row">
                                <div className="student-tasks-sub col-6">
                                    <input type="file" id={"uploadsolution"+task.id}/>
                                </div>
                                <div className="col-6">
                                    <input type="button" value="Submit Task" className="btn btn-warning submit-task-btn" onClick={() => this.handleSubmit(task.id)}/>
                                </div>
                            </div>
                        </div>
                    );
                })
            );
        }
        return (
            <Fragment>
                <Navbar option="student"/>
                {
                    this.state.token ?
                    (
                        <Fragment>
                            <div className="student-level">
                                <label>Task Level:</label><br/>
                                <select id="studentlevel" className="btn btn-dark student-select-btn" onChange={(e) => this.handleLevelChange(e)}>
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                            <div className="studenttask-display">
                                {elem}
                            </div>
                        </Fragment>
                    ) :
                    (
                        <p className="route-back">Route back to Landing page and enter again...</p>
                    )
                }
            </Fragment>
        )
    }

    componentWillUnmount() {
        this.unsubscribe();
    }
}

export default withRouter(Student);
