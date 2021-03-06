jest.mock('@angular/router');

import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';

import { IRecipe, Recipe } from '../recipe.model';
import { RecipeService } from '../service/recipe.service';

import { RecipeRoutingResolveService } from './recipe-routing-resolve.service';

describe('Service Tests', () => {
  describe('Recipe routing resolve service', () => {
    let mockRouter: Router;
    let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
    let routingResolveService: RecipeRoutingResolveService;
    let service: RecipeService;
    let resultRecipe: IRecipe | undefined;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [Router, ActivatedRouteSnapshot],
      });
      mockRouter = TestBed.inject(Router);
      mockActivatedRouteSnapshot = TestBed.inject(ActivatedRouteSnapshot);
      routingResolveService = TestBed.inject(RecipeRoutingResolveService);
      service = TestBed.inject(RecipeService);
      resultRecipe = undefined;
    });

    describe('resolve', () => {
      it('should return IRecipe returned by find', () => {
        // GIVEN
        service.find = jest.fn(id => of(new HttpResponse({ body: { id } })));
        mockActivatedRouteSnapshot.params = { id: 123 };

        // WHEN
        routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
          resultRecipe = result;
        });

        // THEN
        expect(service.find).toBeCalledWith(123);
        expect(resultRecipe).toEqual({ id: 123 });
      });

      it('should return new IRecipe if id is not provided', () => {
        // GIVEN
        service.find = jest.fn();
        mockActivatedRouteSnapshot.params = {};

        // WHEN
        routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
          resultRecipe = result;
        });

        // THEN
        expect(service.find).not.toBeCalled();
        expect(resultRecipe).toEqual(new Recipe());
      });

      it('should route to 404 page if data not found in server', () => {
        // GIVEN
        spyOn(service, 'find').and.returnValue(of(new HttpResponse({ body: null })));
        mockActivatedRouteSnapshot.params = { id: 123 };

        // WHEN
        routingResolveService.resolve(mockActivatedRouteSnapshot).subscribe(result => {
          resultRecipe = result;
        });

        // THEN
        expect(service.find).toBeCalledWith(123);
        expect(resultRecipe).toEqual(undefined);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['404']);
      });
    });
  });
});
