import axios from 'axios';
import { Inject } from 'ng-forward';
import ModalService from '../services/modal.service';

@Inject(ModalService)
class HttpInterceptor {
	constructor(ModalService) {
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
      this.modalService.hide()
      return response;
    }, (error) => {
      console.log(error);
      return Promise.reject(error);
    });
	}

  @Inject(ModalService)
  static init(ModalService) {
    HttpInterceptor.instance = new HttpInterceptor(ModalService);
    return HttpInterceptor.instance;
  }

}

export default angular.module('roseStAdmin.interceptor', []).run(HttpInterceptor.init);
