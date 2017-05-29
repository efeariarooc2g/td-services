TemplateHelpers = {

    enumerate: function(arr, limit, oxfordComma) {

        if(arr) {

            if(limit instanceof Spacebars.kw) {
                var options = limit,
                    limit = options.hash.limit,
                    oxfordComma = options.hash.oxfordComma;
            }

            oxfordComma = oxfordComma === undefined ? true : oxfordComma;
            limit = limit === undefined ? -1 : limit;

            if(arr.length === 1 || limit === 1) {
                return arr[0];
            }

            if(limit !== -1) {
                arr = arr.slice(0, limit);
            }

            var length = arr.length,
                last = arr.pop(),
                suffix = ' and ';

            if(oxfordComma === true
                || (typeof oxfordComma === 'number' && length >= oxfordComma)) {
                suffix = ', ' + suffix;
            }

            return arr.join(', ') + suffix + last;
        }
    },

    condition: function(v1, operator, v2){
        switch (operator) {
            case "==":
            case "eq":
                return v1 === v2;
            case "!=":
            case "neq":
                return v1 !== v2;
            case "===":
            case "ideq":
                return v1 === v2;
            case "!==":
            case "nideq":
                return v1 !== v2;
            case "&&":
            case "and":
                return v1 && v2;
            case "||":
            case "or":
                return v1 || v2;
            case "<":
            case "lt":
                return v1 < v2;
            case "<=":
            case "lte":
                return v1 <= v2;
            case ">":
            case "gt":
                return v1 > v2;
            case ">=":
            case "gte":
                return v1 >= v2;
            default:
                throw new Meteor.Error(`Undefined conditional operator ${operator}`);
        }
    },

    tenantUrl: function(tenantId, requestPath) {
        let tenant = Tenants.findOne(tenantId);
        if (tenant) {
            let domain = tenant.domains[0];
            return domain + '/' + requestPath;
        }
    },

    formatMoney: function(amount, currency){
        if(amount || amount === 0) {
            let formattedAmount = Core.numberWithCommas(amount);
            if (_.isString(currency)) {
                return currency + " " + formattedAmount;
            }

            if (currency && currency.iso) {
                let currSymbol = currency.symbol ? currency.symbol : currency.iso; //default to ISO code if no symbol
                //currSymbol = currSymbol ? currSymbol : '';
                formattedAmount = currSymbol + " " + formattedAmount;
            }
            return formattedAmount;
        }
    },

    variantInfo: function(variantId, field){
        if (!_.isString(field)) field = 'name'; // return variant name if no field specified
        let productVariant = ProductVariants.findOne(variantId);
        if (productVariant) return productVariant[field];
    },

    formatMoneyD: function(amount, currency){
        if(amount || amount === 0) {
            let formattedAmount = Core.numberWithDecimals(amount);
            if (_.isString(currency)) {
                return currency + " " + formattedAmount;
            }

            if (currency && currency.iso) {
                let currSymbol = currency.symbol ? currency.symbol : currency.iso; //default to ISO code if no symbol
                //currSymbol = currSymbol ? currSymbol : '';
                formattedAmount = currSymbol + " " + formattedAmount;
            }
            return formattedAmount;
        }
    },

    formatNumber: function(amount, decimals){
        decimals = decimals || 0;
        return amount === 0 ? 0 : accounting.formatNumber(amount, decimals);
    }

};



