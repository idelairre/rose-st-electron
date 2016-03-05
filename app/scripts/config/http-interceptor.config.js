import axios from 'axios';
import { Inject } from 'ng-forward';
import ModalService from '../services/modal.service';

@Inject('$state', ModalService)
class HttpInterceptor {
	constructor($state, ModalService) {
    this.$state = $state;
    this.modalService = ModalService;

		axios.interceptors.request.use((config) => {
      console.log(config);
      this.modalService.loadingModal();
      return config;
		}, (error) => {
      console.log(error);
      this.modalService.hide()
			return Promise.reject(error);
		});

    axios.interceptors.response.use((response) => {
    	console.log(response);
    	this.modalService.hide();
    	return response;
    }, (error) => {
    	this.modalService.hide();
    	this.modalService.error(error.statusText);
    	return Promise.reject(error);
    });
  }

  @Inject('$state', ModalService)
  static init($state, ModalService) {
    HttpInterceptor.instance = new HttpInterceptor($state, ModalService);
    return HttpInterceptor.instance;
  }

}

export default angular.module('roseStAdmin.interceptor', ['ui.router']).run(HttpInterceptor.init);
