import {Component, OnInit} from '@angular/core';
import {RestService} from '../../../../shared/services/rest.service';
import {UtilsService} from '../../../../shared/services/util.service';
import {ShoppingCartComponent} from '../../components/shopping-cart/shopping-cart.component';
import {ActivatedRoute, Router} from '@angular/router';
import {ListProductStoreComponent} from '../store/listproduct/listproduct.component';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.css']
})
export class SearchPageComponent implements OnInit {
  public loading = false;
  public filters: any = [];
  public data: any = [];
  public meta_key: any = [];
  public src: any = null;
  public queryParams: any = {
    limit: 1,
    all_filters: 'all',
    pagination: 'all'
  };

  constructor(private rest: RestService, private util: UtilsService,
              private shopping: ShoppingCartComponent,
              private list: ListProductStoreComponent,
              private route: ActivatedRoute, private router: Router) {


  }

  ngOnInit() {
    console.log(this.route);
    console.log(this.route.snapshot.params);

    const src = this.route.snapshot.params.src;
    this.route.queryParams.subscribe(params => {
      this.queryParams = {...this.queryParams, ...params};
      this.loadData(src);
    });
  }

  setVariable = (a) => this.filters = a;

  loadData = (src) => {
    this.loading = true;
    this.rest.get(`/rest/search`, {...this.queryParams, ...{src}})
      .then((response: any) => {
        this.loading = false;
        if (response.status === 'success') {
          this.data = response.data;
          this.filters = this.data['filter'];
        }
      });
  };

}
