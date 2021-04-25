jest.mock('@angular/router');

import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';

import { IIngredient, Ingredient } from '../ingredient.model';
import { IngredientService } from '../service/ingredient.service';

import { IngredientRoutingResolveService } from './ingredient-routing-resolve.service';

describe('Service Tests', () => {
  describe('Ingredient routing resolve service', () => {
    let mockRouter: Router;
    let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
    let routingResolveService: IngredientRoutingResolveService;
    let service: IngredientService;
    let resultIngredient: IIngredient | undefined;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [Router, ActivatedRouteSnapshot],
      });
      mockRouter = TestBed.inject(Router);
      mockActivatedRouteSnapshot = TestBed.inject(ActivatedRouteSnapshot);
      routingResolveService = TestBed.inject(IngredientRoutingResolveService);
      service = TestBed.inject(IngredientService);
      resultIngredient = undefined;
    });

    describe('resolve', () => {
      it('should return IIngredient returned by find', () => {
        // GIVEN
        service.find = jest.fn(id => of(new HttpResponse({ body: { id } })));
        mockActivatedRouteSnapshot.params = { id: 123 };

        // WHEN
        routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
          resultIngredient = result;
        });

        // THEN
        expect(service.find).toBeCalledWith(123);
        expect(resultIngredient).toEqual({ id: 123 });
      });

      it('should return new IIngredient if id is not provided', () => {
        // GIVEN
        service.find = jest.fn();
        mockActivatedRouteSnapshot.params = {};

        // WHEN
        routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
          resultIngredient = result;
        });

        // THEN
        expect(service.find).not.toBeCalled();
        expect(resultIngredient).toEqual(new Ingredient());
      });

      it('should route to 404 page if data not found in server', () => {
        // GIVEN
        spyOn(service, 'find').and.returnValue(of(new HttpResponse({ body: null })));
        mockActivatedRouteSnapshot.params = { id: 123 };

        // WHEN
        routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
          resultIngredient = result;
        });

        // THEN
        expect(service.find).toBeCalledWith(123);
        expect(resultIngredient).toEqual(undefined);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['404']);
      });
    });
  });
});
